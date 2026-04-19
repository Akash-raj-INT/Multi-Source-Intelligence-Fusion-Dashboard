import csv
import io

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import IntelligencePoint
from .serializers import IntelligencePointSerializer


@ensure_csrf_cookie
def index(request):
    """Serve the main dashboard HTML page."""
    return render(request, 'dashboard/index.html')


@csrf_exempt
@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def intelligence_points(request):
    """
    GET  /api/points/ → list all intelligence points
    POST /api/points/ → create a new intelligence point
    """
    if request.method == 'GET':
        points = IntelligencePoint.objects.all()
        serializer = IntelligencePointSerializer(
            points, many=True, context={'request': request}
        )
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = IntelligencePointSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_csv(request):
    """
    POST /api/upload-csv/
    Accepts a CSV file with columns: title, description, lat, long, source_type
    Parses and bulk-creates IntelligencePoint records.
    """
    csv_file = request.FILES.get('csv_file')
    if not csv_file:
        return Response(
            {'error': 'No CSV file provided. Use field name "csv_file".'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not csv_file.name.endswith('.csv'):
        return Response(
            {'error': 'File must be a .csv file.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    decoded = csv_file.read().decode('utf-8-sig')  # handles BOM
    reader = csv.DictReader(io.StringIO(decoded))

    created = []
    errors = []
    valid_sources = {'OSINT', 'HUMINT', 'IMINT'}

    for i, row in enumerate(reader, start=2):  # row 1 = header
        try:
            title = row.get('title', '').strip()
            description = row.get('description', '').strip()
            lat = float(row.get('lat', row.get('latitude', '')))
            lng = float(row.get('long', row.get('longitude', '')))
            source_type = row.get('source_type', 'OSINT').strip().upper()

            if not title:
                errors.append(f'Row {i}: missing title')
                continue
            if source_type not in valid_sources:
                source_type = 'OSINT'

            point = IntelligencePoint.objects.create(
                title=title,
                description=description,
                latitude=lat,
                longitude=lng,
                source_type=source_type,
            )
            created.append(point.id)

        except (ValueError, KeyError) as e:
            errors.append(f'Row {i}: {str(e)}')

    return Response({
        'created': len(created),
        'errors': errors,
        'ids': created,
    }, status=status.HTTP_201_CREATED)
