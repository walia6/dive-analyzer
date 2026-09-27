# Dive Analyzer Project Requirements

## Assignment constraints
- Public GitHub repository.
- Regular meaningful Git commits during development.
- Backend/database must use Supabase.
- Use authentication where appropriate.
- Users must be authenticated before creating or modifying saved data.
- Frontend must allow users to view data and perform CRUD operations.
- Application must be deployed.
- README must include:
  - application name and description
  - deployed application link
  - technologies used
  - setup instructions
- A 3–5 minute unlisted YouTube demo will later show:
  - deployed application
  - registration/login if applicable
  - database functionality
  - brief code/project structure walkthrough

## Product
Build a web application called Dive Analyzer.

The application accepts single-dive Subsurface SSRF/XML exports.

A visitor must be able to:
- upload a single-dive Subsurface file
- analyze it without creating an account
- alternatively choose one of the sample dives in public/sample-dives/
- view a useful graphical and numerical analysis of the dive

An authenticated user must additionally be able to:
- save an analyzed dive to their profile
- view their saved dives
- reopen a saved dive
- edit user-supplied metadata/notes for a saved dive
- delete a saved dive

Do not require authentication merely to analyze a dive.

## Sample data
There are 10 real single-dive Subsurface SSRF files in:

public/sample-dives/

These should be treated as parser fixtures and as user-selectable demo dives.

The parser must not assume every file contains every possible metric.
Missing data must be handled gracefully and displayed as unavailable rather than fabricated.

## General expectations
- Target Debian/Linux development.
- Keep secrets out of Git.
- Use the existing .env.local values for Supabase.
- Prefer a clean, modern, professional UI.
- Favor reliability and clarity over unnecessary complexity.
