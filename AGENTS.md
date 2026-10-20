<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Django calls in centralized Axios API modules and use the existing cookie session; this preserves the external backend contract.
- Parse the performance endpoint by response content and prepare PDF blobs before download clicks; this supports either Django response type and mobile downloads without invented endpoints.
- Validate academic-year names and teaching-course IDs against their fetched option lists; this prevents submitting arbitrary selections.
- Use a browser-generated PDF of returned performance rows only when Django returns JSON; preserve original Django PDF responses unchanged and prepare either blob before the download gesture.
- Validate grading payloads in shared helpers and keep physical bulk entry separate from online submissions; Django grades identify assessments and students rather than submissions.
