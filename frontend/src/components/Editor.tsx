import { CheckIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import { useMemo, useState } from "react";
import useMessage from "../hooks/useMessage";
import useMessageValidation from "../hooks/useMessageValidation";
import useToken from "../hooks/useToken";
import EditorAttachments from "./EditorAttachments";
import EditorComponentRow from "./EditorComponentRow";
import EditorEmbed from "./EditorEmbed";
import StyledInput from "./StyledInput";
import StyledTextarea from "./StyledTextarea";
import useAutoAnimate from "../hooks/useAutoAnimate";
import useSelectedMode from "../hooks/useSelectedMode";

export default function Editor() {
  const [msg, dispatchMsg] = useMessage();
  const [token] = useToken();
  const errors = useMessageValidation();

  const [embedsCollapsed, setEmbedsCollapsed] = useState(
    msg.embeds.length === 0
  );
  const [componentsCollapsed, setComponentsCollapsed] = useState(
    msg.components.length === 0
  );

  const embedCharacters = useMemo(
    () =>
      msg.embeds
        .map(
          (e) =>
            (e.title?.length || 0) +
            (e.description?.length || 0) +
            (e.author?.name.length || 0) +
            (e.footer?.text.length || 0) +
            e.fields
              .map((f) => f.name.length + f.value.length)
              .reduce((a, b) => a + b, 0)
        )
        .reduce((a, b) => a + b, 0),
    [msg.embeds]
  );

  const [embedsSection] = useAutoAnimate<HTMLDivElement>();
  const [componentsSection] = useAutoAnimate<HTMLDivElement>();

  const [selectedMode] = useSelectedMode();

  function togglePings() {
    if (msg.allowed_mentions !== undefined) {
      dispatchMsg({ type: "setAllowedMentions", value: undefined });
    } else {
      dispatchMsg({
        type: "setAllowedMentions",
        value: {
          parse: [],
          users: [],
          roles: [],
          replied_user: false,
        },
      });
    }
  }

  return (
    <div className="space-y-5 flex-auto">
      <div className="flex space-x-3">
        <StyledInput
          label="Username"
          type="text"
          className="flex-auto"
          maxLength={80}
          value={msg.username || ""}
          onChange={(value) =>
            dispatchMsg({ type: "setUsername", value: value || undefined })
          }
          errors={errors?.username?._errors}
        />
        <StyledInput
          label="Avatar URL"
          type="url"
          className="flex-auto"
          value={msg.avatar_url || ""}
          onChange={(value) =>
            dispatchMsg({ type: "setAvatarUrl", value: value || undefined })
          }
          errors={errors?.avatar_url?._errors}
        />
        <div className="flex-none">
          <div className="uppercase text-gray-300 text-sm font-medium mb-1.5">
            Pings
          </div>
          <div
            className="bg-dark-2 w-10 h-10 rounded cursor-pointer flex items-center justify-center"
            onClick={togglePings}
          >
            {!msg.allowed_mentions && <CheckIcon className="w-8 h-8" />}
          </div>
        </div>
      </div>
      <StyledTextarea
        label="Content"
        value={msg.content || ""}
        maxLength={2000}
        onChange={(value) => dispatchMsg({ type: "setContent", value })}
        errors={errors?.content?._errors}
      />
      <EditorAttachments />
      <div ref={embedsSection}>
        <div
          className="flex-auto cursor-pointer flex items-center space-x-2 text-gray-300 select-none mb-2"
          onClick={() => setEmbedsCollapsed(!embedsCollapsed)}
        >
          <ChevronRightIcon
            className={`h-5 w-5 transition-transform duration-300 ${
              embedsCollapsed ? "" : "rotate-90"
            }`}
          />
          <div className="flex space-x-2 items-center">
            <div className="text-lg font-medium">Embeds</div>
            <div
              className={`italic font-light text-sm ${
                embedCharacters < 6000 ? "text-gray-400" : "text-red"
              }`}
            >
              {embedCharacters} / 6000
            </div>
            {!!errors?.embeds && (
              <ExclamationCircleIcon className="text-red w-5 h-5" />
            )}
          </div>
        </div>
        {!embedsCollapsed && (
          <>
            {msg.embeds.map((embed, i) => (
              <EditorEmbed
                index={i}
                embed={embed}
                key={embed.id}
                errors={(errors?.embeds || [])[i]}
              />
            ))}
            <div className="space-x-3 mt-3">
              {msg.embeds.length < 10 ? (
                <button
                  className="bg-blurple px-3 py-2 rounded transition-colors hover:bg-blurple-dark"
                  onClick={() => dispatchMsg({ type: "addEmbed" })}
                >
                  Add Embed
                </button>
              ) : (
                <button
                  disabled
                  className="bg-dark-3 px-3 py-2 rounded transition-colors cursor-not-allowed text-gray-300"
                >
                  Add Embed
                </button>
              )}
              <button
                className="px-3 py-2 rounded border-2 border-red hover:bg-red transition-colors"
                onClick={() => dispatchMsg({ type: "clearEmbeds" })}
              >
                Clear Embeds
              </button>
            </div>
          </>
        )}
      </div>
      {!!token && selectedMode === "channel" && (
        <div ref={componentsSection}>
          <div
            className="flex-auto cursor-pointer flex items-center space-x-2 text-gray-300 select-none mb-2"
            onClick={() => setComponentsCollapsed(!componentsCollapsed)}
          >
            <ChevronRightIcon
              className={`h-5 w-5 transition-transform duration-300 ${
                componentsCollapsed ? "" : "rotate-90"
              }`}
            />
            <div className="text-lg font-medium">Components</div>
            {!!errors?.components && (
              <ExclamationCircleIcon className="text-red w-5 h-5" />
            )}
          </div>
          {!componentsCollapsed && (
            <>
              {msg.components.map((row, i) => (
                <EditorComponentRow
                  key={row.id}
                  row={row}
                  index={i}
                  errors={(errors?.components || [])[i]}
                />
              ))}
              <div className="space-x-3 mt-3">
                {msg.components.length < 5 ? (
                  <>
                    <button
                      className="bg-blurple px-3 py-2 rounded transition-colors hover:bg-blurple-dark"
                      onClick={() => dispatchMsg({ type: "addComponentRow" })}
                    >
                      Add Button Row
                    </button>
                    <button
                      className="bg-blurple px-3 py-2 rounded transition-colors hover:bg-blurple-dark"
                      onClick={() =>
                        dispatchMsg({
                          type: "addComponentSelectRow",
                        })
                      }
                    >
                      Add Select Menu
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="bg-dark-3 px-3 py-2 rounded transition-colors cursor-not-allowed text-gray-300"
                    >
                      Add Button Row
                    </button>
                    <button
                      disabled
                      className="bg-dark-3 px-3 py-2 rounded transition-colors cursor-not-allowed text-gray-300"
                    >
                      Add Select Menu
                    </button>
                  </>
                )}
                <button
                  className="px-3 py-2 rounded border-2 border-red hover:bg-red transition-colors"
                  onClick={() => dispatchMsg({ type: "clearComponentRows" })}
                >
                  Clear Rows
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
