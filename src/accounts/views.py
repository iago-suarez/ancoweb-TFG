# from django.shortcuts import render
from django.contrib.auth.forms import AuthenticationForm
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views import generic
from django.shortcuts import redirect
from django.core.urlresolvers import reverse_lazy, reverse
from django.contrib.auth import authenticate, REDIRECT_FIELD_NAME
from django.contrib.auth import login, logout
from django.contrib import messages
from . import forms
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.generic import FormView, TemplateView


class SignUp(generic.edit.FormMixin, generic.TemplateView):
    signup_form_class = forms.SignupForm

    def post(self, request, *args, **kwargs):
        form = self.signup_form_class(**self.get_form_kwargs())
        if not form.is_valid():
            messages.add_message(request,
                                 messages.ERROR,
                                 "Unable to register! "
                                 "Please retype the details")
            return super().get(request,
                               signup_form=form)
        form.save()
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password1"]
        messages.add_message(request,
                             messages.INFO,
                             "{0} added sucessfully".format(
                                 username))
        # Login automatically
        user = authenticate(username=username, password=password)
        login(self.request, user)
        return redirect("home")


class HomeView(SignUp, generic.TemplateView):
    template_name = "home.html"

    def get_context_data(self, **kwargs):
        kwargs["signup_form"] = self.signup_form_class()
        return super(HomeView, self).get_context_data(**kwargs)


class LoginView(FormView):
    form_class = AuthenticationForm
    redirect_field_name = REDIRECT_FIELD_NAME
    template_name = 'registration/login.html'

    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        # If there is a next parameter we redirect to this page,
        # else we redirect to home
        self.success_url = self.request.GET.get('next', reverse('home'))
        return super(LoginView, self).dispatch(*args, **kwargs)

    def form_valid(self, form):
        """
        The user has provided valid credentials (this was checked in
        AuthenticationForm.is_valid()). So now we can log him in.
        """
        login(self.request, form.get_user())

        return HttpResponseRedirect(self.get_success_url())


class LogoutView(generic.RedirectView):
    url = reverse_lazy("home")

    def get(self, request, *args, **kwargs):
        logout(request)
        messages.add_message(request, messages.INFO, 'Logout successful!')
        return super().get(request, *args, **kwargs)


class AboutView(TemplateView):
    template_name = "about.html"
