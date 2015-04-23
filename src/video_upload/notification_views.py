from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import generic
from video_upload.models import video_upload


class NotificationsView(generic.View):
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(NotificationsView, self).get_context_data(**kwargs)
        context['notification_list'] = video_upload.objects.filter(owner=self.request.user.id)
        return context


class DeleteView(generic.DeleteView):
    model = video_upload
    success_url = reverse_lazy('home')

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(DeleteView, self).dispatch(*args, **kwargs)

