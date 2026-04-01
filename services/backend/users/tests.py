import json
from django.test import TestCase

from .models import User, UserSession


class AuthRefreshLogoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            first_name='Test',
            last_name='User',
            password='Password123'
        )

    def _login(self):
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': 'test@example.com',
                'password': 'Password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_refresh_rotates_token_and_updates_session(self):
        login_data = self._login()
        old_refresh = login_data['refresh_token']

        refresh_response = self.client.post(
            '/api/auth/refresh',
            data=json.dumps({'refresh': old_refresh}),
            content_type='application/json'
        )

        self.assertEqual(refresh_response.status_code, 200)
        refresh_data = refresh_response.json()
        self.assertIn('access_token', refresh_data)
        self.assertIn('refresh_token', refresh_data)
        self.assertNotEqual(refresh_data['refresh_token'], old_refresh)

        session = UserSession.objects.get(user=self.user)
        self.assertEqual(session.token, refresh_data['refresh_token'])
        self.assertTrue(session.is_active)

    def test_refresh_fails_for_inactive_session(self):
        login_data = self._login()
        refresh_token = login_data['refresh_token']

        session = UserSession.objects.get(token=refresh_token)
        session.is_active = False
        session.save(update_fields=['is_active', 'last_activity'])

        refresh_response = self.client.post(
            '/api/auth/refresh',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )

        self.assertEqual(refresh_response.status_code, 401)

    def test_logout_revokes_refresh_token(self):
        login_data = self._login()
        refresh_token = login_data['refresh_token']

        logout_response = self.client.post(
            '/api/auth/logout',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )

        self.assertEqual(logout_response.status_code, 200)

        session = UserSession.objects.get(token=refresh_token)
        self.assertFalse(session.is_active)

        refresh_response = self.client.post(
            '/api/auth/refresh',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )

        self.assertEqual(refresh_response.status_code, 401)
