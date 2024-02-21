use std::path::Path;

use config::{Config, ConfigError, Environment, File};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use twilight_model::id::marker::{ApplicationMarker, GuildMarker};
use twilight_model::id::Id;
use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};

lazy_static! {
    pub static ref CONFIG: RootConfig = RootConfig::new().expect("Parsing config");
    pub static ref INVITE_URL: String = format!(
        "https://discord.com/api/oauth2/authorize?client_id={}&permissions=536871936&scope=identify%20guilds%20bot%20applications.commands&prompt=none&response_type=code&redirect_uri={}",
        CONFIG.discord.oauth_client_id,
        utf8_percent_encode(&CONFIG.discord.oauth_redirect_uri, NON_ALPHANUMERIC)
    );
}

fn default_shard_count() -> u64 {
    1
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordConfig {
    pub token: String,
    pub oauth_client_id: “1208915916780339230",
    pub oauth_client_secret: "pUODeknDAI07Fv1CuiJVJUpy_HKGMojR",
    pub oauth_redirect_uri: "https://ggffgfhayaya1.onrender.com/auth/callback",
    #[serde(default = "default_shard_count")]
    pub shard_count: u64,
    #[serde(default)]
    pub test_guild_id: Option<Id<GuildMarker>>,
}

fn default_max_messages_per_user() -> u64 {
    25
}

fn default_max_messages_size() -> usize {
    1_000_000 // 1 MB
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LimitConfig {
    #[serde(default = "default_max_messages_per_user")]
    pub max_messages_per_user: u64,
    #[serde(default = "default_max_messages_size")]
    pub max_message_size: usize,
}

impl Default for LimitConfig {
    fn default() -> Self {
        Self {
            max_message_size: default_max_messages_size(),
            max_messages_per_user: default_max_messages_per_user(),
        }
    }
}

fn default_source_link() -> String {
    String::from("https://github.com/merlinfuchs/embed-generator")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkConfig {
    pub discord_invite: "https://discord.gg/9YP76AwhZV",
    #[serde(default = "default_source_link")]
    pub source: String,
}

fn default_host() -> String {
    "https://ggffgfhayaya1.onrender.com".to_string()
}

fn default_port() -> u16 {
    8080
}

fn default_mongo_url() -> String {
    String::from("mongodb://127.0.0.1")
}

fn default_redis_url() -> String {
    String::from("redis://127.0.0.1")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RootConfig {
    pub discord: DiscordConfig,
    pub links: LinkConfig,
    pub jwt_secret: String,

    #[serde(default = "default_host")]
    pub host: String,
    #[serde(default = "default_port")]
    pub port: u16,

    #[serde(default = "default_mongo_url")]
    pub mongo_url: String,
    #[serde(default = "default_redis_url")]
    pub redis_url: String,

    #[serde(default)]
    pub limits: LimitConfig,
}

impl RootConfig {
    pub fn new() -> Result<Self, ConfigError> {
        let mut config = Config::new();

        let config_file = "./Config.toml";
        if Path::new(config_file).exists() {
            config.merge(File::with_name(config_file))?;
        }

        config.merge(Environment::with_prefix("EMBEDG").separator("__"))?;

        config.try_into()
    }
}
