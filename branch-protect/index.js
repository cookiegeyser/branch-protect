const { createAppAuth } = require("@octokit/auth-app");
const { request } = require("@octokit/request");

module.exports = async function (context, req) {
    
    const auth = createAppAuth({
        appId: process.env["APP_ID"],
        privateKey: process.env["PRIVATE_KEY"],
        installationId: 12813104,
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

    if (req.body.repository != null)
    {
        var req_owner = req.body.repository.owner.login;
        var req_repo = req.body.repository.name;
        // the default branch parameter doesn't seem to be correct
        // some repos are returning "master", but the api call to branches
        // seems to expect "main"
        var req_default_branch = req.body.repository.default_branch;

        const result = await requestWithAuth("GET /repos/:owner/:repo/branches", {
        //const result = await requestWithAuth("GET /orgs/:owner/repos", {
            owner: req_owner,
            repo: req_repo,
            branch: 'main'
        });

        context.log(JSON.stringify(result.data))

        var id = req.body.repository.id;
        context.log(`repository id = ${id}`);

        var name = req.body.repository.name;
        context.log(`repository name = ${name}`);
    }
}