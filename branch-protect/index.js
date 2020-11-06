const { createAppAuth } = require("@octokit/auth-app");
const { request } = require("@octokit/request");


module.exports = async function (context, req) {
    
    const auth = createAppAuth({
        appId: process.env["APP_ID"],
        privateKey: process.env["PRIVATE_KEY"],
        installationId: req.body.installation.id,
    });

    const { token, appId } = await auth({ type: "app" });

    const requestWithAuth = request.defaults({
        //headers: {
        //authentication: `token ${token}`,
        //},
        request: {
            hook: auth.hook,
        },
    });

    context.log('JavaScript HTTP trigger function processed a request.');

    var created = req.body.action === "created";
    context.log(`repository created = ${created}`);

    if (req.body.repository != null && created)
    {
        var req_owner = req.body.repository.owner.login;
        var req_repo = req.body.repository.name;
        // the default branch parameter doesn't seem to be correct
        // some repos are returning "master", but the api call to branches
        // seems to expect "main"
        var req_default_branch = req.body.repository.default_branch;

        context.log(`New repository detected: ${req_owner}/${req_repo}`);
        try {
            const result = await requestWithAuth("GET /repos/:owner/:repo/branches/:branch", {
                owner: req_owner,
                repo: req_repo,
                branch: 'main'
            });
        } catch {
            context.log("Retrying branch access after 3 seconds");
            await new Promise(r => setTimeout(r, 3000));
            const result = await requestWithAuth("GET /repos/:owner/:repo/branches/:branch", {
                owner: req_owner,
                repo: req_repo,
                branch: 'main'
            });
        }

        const protection_result = await requestWithAuth("PUT /repos/:owner/:repo/branches/:branch/protection", {
            owner: req_owner,
            repo: req_repo,
            branch: 'main',
            required_status_checks: null,
            enforce_admins: null,
            required_pull_request_reviews: {
                dismissal_restrictions: {},
                dismiss_stale_reviews: true,
                require_code_owner_reviews: false,
            },
            restrictions: null,

        });

        context.log(`Branch Protection applied for ${req_owner}/${req_repo}`)

        context.log("Create Issue with protection details")
            const issue_result = await requestWithAuth("POST /repos/{owner}/{repo}/issues", {
                owner: req_owner,
                repo: req_repo,
                title: "Branch protection applied",
                body: `@richarda The main branch in this repository has been protected automatically by the [branch-protect app](https://github.com/cookiegeyser/branch-protect).\n- Pushing directly to the main branch is not allowed.\n- A pull request with at least 1 approval is required to merge changes.\n- Changes made after an approval require re-approval.\n\n[View or Edit Branch protection rules](https://github.com/${req_owner}/${req_repo}/settings/branches)`
            });
    }
}