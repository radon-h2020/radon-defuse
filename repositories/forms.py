import os
from pathlib import Path

from django import forms
from django.core.exceptions import ValidationError


class RepositoryScorerForm(forms.Form):
    input_path_to_clones = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'text', 'placeholder': 'Enter path'})
    )

    input_github_token = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Paste here your personal token'}),
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


class RepositoryMinerForm(forms.Form):

    input_labels = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'text', 'placeholder': 'Separate labels by '
                                                                                              'comma (e.g., bug, '
                                                                                              'type: bug, bugfix)'})
    )

    input_regex = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'text', 'placeholder': 'e.g., (bug|fix|error'
                                                                                              '|crash|problem|fail'
                                                                                              '|defect|patch)'})
    )

    input_path_to_clones = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'text', 'placeholder': 'Enter path'})
    )

    input_github_token = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Paste here your personal token'}),
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