from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='IntelligencePoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('source_type', models.CharField(
                    choices=[('OSINT', 'Open Source Intelligence'), ('HUMINT', 'Human Intelligence'), ('IMINT', 'Imagery Intelligence')],
                    default='OSINT', max_length=10
                )),
                ('image', models.ImageField(blank=True, null=True, upload_to='uploads/')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
