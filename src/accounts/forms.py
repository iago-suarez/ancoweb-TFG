from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.forms import UserCreationForm
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Field
from django.core.urlresolvers import reverse


class LoginForm(AuthenticationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.set_form_action(reverse("accounts:login") + "?next=/")
        self.helper.form_class = 'form-signin'
        self.helper.form_id = 'signin-form'
        self.helper.form_show_labels = True
        self.helper.layout = Layout(
            Field('username', placeholder="Username", autofocus="", css_class='form-control'),
            Field('password', placeholder="Password", css_class='form-control'),
            Submit('sign_in', 'Sign in', css_class="btn btn-lg btn-primary btn-block"),
            )


class CompactLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.form_class = 'form-inline navbar-form pull-right'
        self.helper.form_show_labels = False
        self.helper.form_show_errors = False
        self.helper.layout = Layout(
            Field('username', placeholder="Username", autofocus=""),
            Field('password', placeholder="Password"),
            Submit('sign_in', 'Sign in', css_class="btn-sm btn-success"),
            )


class SignupForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'signup-form'
        self.helper.form_show_labels = False
        self.helper.form_show_errors = False
        self.helper.help_text_inline = False
        self.helper.layout = Layout(
            Field('username', placeholder="Username"),
            Field('password1', placeholder="Password"),
            Field('password2', placeholder="Re-type Password"),
            Submit('sign_up', 'Sign up', css_class="btn-warning"),
            )
