from django import template
from accounts import forms

register = template.Library()


@register.simple_tag(takes_context=True)
def signin_form(context):
    context['signin_form'] = forms.LoginForm()
    return ''