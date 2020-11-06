# branch-protect

This web app responds to a GitHub App webhook and protects the main branch of newly created repositories.

# Install this app in your organization
To use this app in your organization, you will need to deploy to Azure Functions, configure GitHub organization settings, and configure settings in your deployed function.

## Deploy source to Azure Functions
Clone the source for this app
```shell
>git clone https://github.com/cookiegeyser/branch-protect.git
```
Open the cloned folder in Visual Studio Code, and install the Azure Functions extension.

#### Use VS Code to create a new Function App
Sign in to Azure, choose your subscription and create a new function

![](docs/new-func-in-azure.png)

Choose a unique name, runtime (Node 10), and Region. The extension will log progress in the Output window of VS Code.

#### Deploy to Azure
From the Azure Functions extension, select "Deploy to Function App"

![](docs/deploy.png)

From the VS Code Output window for Azure Functions, copy the app URL (to configure the GitHub App in the following steps)

![](docs/app-url.png)

## Create and Register App on GitHub

To install this app, create a new GitHub App registration in your organization:

In Organization Settings->Developer Apps->GitHub Apps:

![](docs/new-app.png)


### Configure app
- set a name (_e.g. branch-protect_)
- write a short description (_e.g. Protect the default branch of new repositories in this organization._)
- set a Home Page URL (_e.g. github url for the source_)
- Activate the webhook, provide the app url from the deployment above, and leave SSL verification enabled
- Generate and save a private key as a .pem file (needed to finish configuring your Azure Function App)
- Copy or note the App ID at the top of the App Configuration
- Configure the GitHub App "Permissions and Events" settings:
  - "Read and Write" Administration
  - "Read" Contents
  - "Read and Write" Issues
- Subscribe to "Repository" Events

### Configure Azure Function
Back to the source in VS Code, create or edit `local.settings.json` in the source directory
```JSON
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "APP_ID": "<your app id>",
    "PRIVATE_KEY": "-----BEGIN RSA PRIVATE KEY-----\n"
  }
}
```
You will need to replace any new lines with newline characters `\n` to save this secret as a string in the app settings/environment variables.

:warning: **Do not check in this file to the source code!**

The VS Code Azure Functions Extension can upload these local settings to a deployed app.

Right click on the function app in the Azure Functions extension, and select Upload Local Settings

![](docs/upload-settings.png)

:partying_face: Hooray! Your app is configured and deployed.

## Development

If you haven't created a local.settings.json, see above.

This app targets deployment to Azure Functions. If you want to make changes to the source, you can follow the instructions above to re-deploy or deploy to a staging app location. To run locally, use Azure Functions Core tools to start the function on port 80 `func start -p 80` and a service like [ngrok](https://ngrok.com/) to test the webhook coming from the GitHub App.

This app uses libraries from [GitHub Octokit](https://github.com/octokit) to interact with the GitHub API
- [octokit/auth-app](https://github.com/octokit/auth-app.js) for authentication
- [@octokit/request](https://github.com/octokit/request.js) to make the api requests

See the [GitHub API docs](https://docs.github.com/en/free-pro-team@latest/rest) for more details
 

We could secure this further with a webhook secret
https://docs.microsoft.com/en-us/learn/modules/monitor-github-events-with-a-function-triggered-by-a-webhook/9-exercise-secure-webhook-payloads-with-secret

https://humanwhocodes.com/snippets/2020/08/validate-github-webhook-signature-nodejs/
