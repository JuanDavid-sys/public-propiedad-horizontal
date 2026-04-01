# Generated manually to fix Pet table missing
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('residential', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('species', models.CharField(default='Canino', max_length=50, verbose_name='Especie')),
                ('breed', models.CharField(blank=True, max_length=100, null=True, verbose_name='Raza')),
                ('color', models.CharField(blank=True, max_length=80, null=True, verbose_name='Color')),
                ('age', models.CharField(blank=True, max_length=20, null=True, verbose_name='Edad')),
                ('gender', models.CharField(choices=[('Macho', 'Macho'), ('Hembra', 'Hembra'), ('No especificado', 'No especificado')], default='No especificado', max_length=20, verbose_name='Género')),
                ('vaccinated', models.BooleanField(default=False, verbose_name='Vacunado')),
                ('status', models.CharField(default='Al Día', max_length=30, verbose_name='Estado')),
                ('observations', models.TextField(blank=True, null=True, verbose_name='Observaciones')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pets', to='residential.residentialunit', verbose_name='Apartamento')),
            ],
            options={
                'verbose_name': 'Mascota',
                'verbose_name_plural': 'Mascotas',
            },
        ),
    ]
