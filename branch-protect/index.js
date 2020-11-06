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

        const result2 = await requestWithAuth("PUT /repos/:owner/:repo/branches/:branch/protection", {
            owner: req_owner,
            repo: req_repo,
            branch: 'main',
            required_status_checks: null,
            enforce_admins: null,
            required_pull_request_reviews: {
                dismissal_restrictions: {},
                dismiss_stale_reviews: true,
                require_code_owner_reviews: true,
            },
            restrictions: null,

        });

        context.log(`Branch Protection applied for ${req_owner}/${req_repo}`)
    }
}