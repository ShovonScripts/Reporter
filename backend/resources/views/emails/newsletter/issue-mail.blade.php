<x-mail::message>
# {{ $issue->subject }}

{!! $issue->body_html !!}

<hr>

<small>
You're receiving this because you subscribed to **{{ config('app.name') }}**.
<br>
<a href="{{ $unsubscribeUrl }}">Unsubscribe</a>
</small>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>