# personal-trackers

Sama OS is a personal productivity and tracking dashboard built with Vanilla JavaScript and Firebase.

## Features

- Email/password authentication with Firebase Auth
- Personal dashboard with tasks, habits, expenses, journal, mood, goals, and reviews
- Firebase Firestore persistence
- Static deployment friendly

## Local Preview

Serve the project from the repository root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## GitHub Pages

This project is ready for GitHub Pages because `index.html` is in the repository root and assets use relative paths.

After enabling Pages on the repository, the site URL will be:

```text
https://ibrahimmohamed101.github.io/personal-trackers/
```

## Firebase Note

Add this authorized domain in Firebase Authentication settings:

```text
ibrahimmohamed101.github.io
```

Do not commit Firebase service account files or other private credentials to the repository.
