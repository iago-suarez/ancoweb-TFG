from progressbarupload.uploadhandler import ProgressBarUploadHandler


class VideoUploadHandler(ProgressBarUploadHandler):
    def upload_complete(self):

        super().upload_complete()