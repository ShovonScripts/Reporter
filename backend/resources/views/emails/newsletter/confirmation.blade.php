<x-mail::message>
# Confirm your subscription

Thanks for signing up for **{{ config('app.name') }}**!

Click the button below to confirm your email address and start receiving the newsletter:

<x-mail::button :url="$confirmUrl">
Confirm subscription
</x-mail::button>

If you didn't sign up for this newsletter, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>