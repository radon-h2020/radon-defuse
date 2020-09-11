import datetime
from django import forms


class MinerSettingsForm(forms.Form):
    MONTHS = {
        1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
        5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
        9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
    }
    YEARS = [x for x in range(2014, 2021)]

    INTERVAL_CHOICES = (
        (24, "One day"),
        (168, "One week")
    )

    input_date_from = forms.DateField(
        required=True,
        label='From',
        widget=forms.SelectDateWidget(years=YEARS, months=MONTHS),
    )

    input_date_to = forms.DateField(
        required=True,
        label='To',
        widget=forms.SelectDateWidget(years=YEARS, months=MONTHS),
        initial=datetime.date.today()
    )

    input_pushed_after = forms.DateField(
        required=True,
        label='Pushed after',
        widget=forms.SelectDateWidget(years=YEARS, months=MONTHS),
        initial=datetime.date.today()
    )

    input_timedelta = forms.ChoiceField(
        required=True,
        label='Time delta',
        choices=INTERVAL_CHOICES
    )

    input_issues = forms.IntegerField(
        required=False,
        min_value=0,
        initial=0
    )

    input_releases = forms.IntegerField(
        required=False,
        min_value=0,
        initial=0
    )

    input_stars = forms.IntegerField(
        required=False,
        min_value=0,
        initial=0
    )

    input_watchers = forms.IntegerField(
        required=False,
        min_value=0,
        initial=0
    )

    input_github_token = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Paste here your token'}),
        error_messages={
            'required': 'Access token is required. You can generate one from https://github.com/settings/tokens. \
                        Please, make sure to select access to public repositories and issues.'
        }
    )

    def clean_input_timedelta(self):
        return int(self.cleaned_data['input_timedelta'])

    def clean_input_issues(self):
        issues = self.cleaned_data['input_issues']
        if not issues:
            issues = 0

        return issues

    def clean_input_releases(self):
        releases = self.cleaned_data['input_releases']
        if not releases:
            releases = 0

        return releases

    def clean_input_stars(self):
        stars = self.cleaned_data['input_stars']
        if not stars:
            stars = 0

        return stars

    def clean_input_watchers(self):
        watchers = self.cleaned_data['input_watchers']
        if not watchers:
            watchers = 0

        return watchers
