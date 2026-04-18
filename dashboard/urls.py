from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/points/', views.intelligence_points, name='intelligence-points'),
    path('api/upload-csv/', views.upload_csv, name='upload-csv'),
]
