module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var created = req.body.action === "created";
    context.log(`repository created = ${created}`);

    if (req.body.repository != null)
    {
        var id = req.body.repository.id;
        context.log(`repository id = ${id}`);

        var name = req.body.repository.name;
        context.log(`repository name = ${name}`);
    }
}