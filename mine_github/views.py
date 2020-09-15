from datetime import datetime
from django.shortcuts import render
from django.http import StreamingHttpResponse

from mine_github import miner
from mine_github.forms import MinerSettingsForm


def start(settings: dict):
    yield """
    <html>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <body class="bg-dark">
            <div class="py-5 text-center bg-dark text-white">
                <h2>Mining report</h2>
                <p class="lead font-weight-light">Mining started at: {0}</p>
            </div>
            <table class="table table-striped table-dark">
                <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Repository</th>
                      <th scope="col"><span class="badge badge-pill badge-danger">Issues</span></th>
                      <th scope="col"><span class="badge badge-pill badge-success">Releases</span></th>
                      <th scope="col"><span class="badge badge-pill badge-warning">Stars</span></th>
                      <th scope="col"><span class="badge badge-pill badge-info">Watchers</span></th>
                      <th scope="col"><span class="badge badge-pill badge-secondary">Primary language</span></th>
                      <th scope="col"><span class="badge badge-pill badge-light">Last push</span></th>
                    </tr>
                </thead>
                <tbody>
    """.format(datetime.now().today())

    i = 0

    last_date_from = ''

    for mining_data in miner.mine(token=settings['input_github_token'],
                                  date_from=settings['input_date_from'],
                                  date_to=settings['input_date_to'],
                                  push_after=settings['input_pushed_after'],
                                  timedelta=settings['input_timedelta'],
                                  min_issues=settings['input_issues'],
                                  min_releases=settings['input_releases'],
                                  min_stars=settings['input_stars'],
                                  min_watchers=settings['input_watchers']):

        if str(mining_data['search_from']) > str(last_date_from):
            last_date_from = mining_data['search_from']
            yield """
            <tr><td colspan="8" style='text-align:center;vertical-align:middle'>
                Search interval: {0} - {1} <br> 
                Quota: {2} - Reset at {3}
            </td></tr>
        """.format(mining_data['search_from'],
                   mining_data['search_to'],
                   mining_data['quota'],
                   mining_data['quota_reset_at'])

        i += 1

        repo = mining_data['repository']

        yield """
            <tr>
              <th scope="row">{0}</th>
              <td><a href="{1}" target="_blank">{2}/{3}</a></td>
              <td>{4}</td>
              <td>{5}</td>
              <td>{6}</td>
              <td>{7}</td>
              <td>{8}</td>
              <td>{9}</td>
            </tr>
        """.format(
            i,
            repo['url'],
            repo['owner'],
            repo['name'],
            repo['issues'],
            repo['releases'],
            repo['stars'],
            repo['watchers'],
            repo['primary_language'],
            repo['pushed_at']
        )

    yield """</tbody>
        </table>
        
        <div class="py-5 text-center bg-dark text-white">
            <p class="lead font-weight-light">Mining completed at: {0}</p>
        </div>
    </body>
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    </html>""".format(datetime.now().today())


def miner_settings(request):
    form = MinerSettingsForm(request.GET)

    if request.method == 'POST':
        form = MinerSettingsForm(request.POST)
        if form.is_valid():
            return StreamingHttpResponse(start(form.cleaned_data))

    return render(request, 'miner_settings.html', {'form': form})
