use twilight_http::client::InteractionClient;
use twilight_model::application::command::{Command, CommandType};
use twilight_model::application::interaction::ApplicationCommand;
use twilight_model::id::Id;
use twilight_util::builder::command::CommandBuilder;

use crate::bot::commands::{InteractionResult, simple_response};
use crate::bot::commands::message::{MessageDump, VaultbinPasteCreateRequest, VaultbinPasteCreateResponse};

pub fn command_definition() -> Command {
    CommandBuilder::new(
        "Dump Message".into(),
        "".into(),
        CommandType::Message,
    )
    .build()
}

pub async fn handle_command(
    http: InteractionClient<'_>,
    cmd: Box<ApplicationCommand>,
) -> InteractionResult {
    let msg_id = Id::new(cmd.data.target_id.unwrap().get());
    let msg = cmd.data.resolved.unwrap().messages.remove(&msg_id).unwrap();

    let msg_json = serde_json::to_string_pretty(&MessageDump {
        id: msg.id,
        channel_id: msg.channel_id,
        username: msg.author.name,
        avatar_url: msg.author.avatar.map(|a| {
            format!(
                "https://cdn.discordapp.com/avatars/{}/{}.webp",
                msg.author.id, a
            )
        }),
        content: msg.content,
        embeds: msg.embeds,
        components: msg.components,
    })?;

    let client = awc::ClientBuilder::new().finish();

    let resp: VaultbinPasteCreateResponse = client
        .post("https://vaultb.in/api/pastes")
        .send_json(&VaultbinPasteCreateRequest {
            content: msg_json,
            language: "json".into(),
        })
        .await?
        .json()
        .await?;

    simple_response(
        &http,
        cmd.id,
        &cmd.token,
        format!(
            "You can find the JSON code here: <https://vaultb.in/{}>",
            resp.data.id
        ),
    )
    .await?;

    Ok(())
}
