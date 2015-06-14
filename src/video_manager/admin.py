from django.contrib import admin

from video_manager.models import VideoModel, AnalysisProcess

admin.site.register(VideoModel)
admin.site.register(AnalysisProcess)
