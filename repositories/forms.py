import os
from pathlib import Path

from django import forms
from django.core.exceptions import ValidationError


class RepositoryScorerForm(forms.Form):
    input_path_to_clones = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Paste here the path', 'size':50})
    )

    input_github_token = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Paste here your token', 'size':50}),
        error_messages={
            'required': 'Access token is required. You can generate one from https://github.com/settings/tokens. \
                        Please, make sure to select access to public repositories and issues.'
        }
    )

    def clean_input_path_to_clones(self):
        path = self.cleaned_data['input_path_to_clones']
        if not os.path.isdir(path):
            raise ValidationError(message='Invalid path. Please, make sure the directory exists.')

        return Path(path)
