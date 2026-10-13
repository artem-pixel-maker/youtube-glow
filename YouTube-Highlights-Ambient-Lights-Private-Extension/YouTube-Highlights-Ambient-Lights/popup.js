const status = document.getElementById("status");
async function send(message) {
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id || !/^https:\/\/(www\.)?youtube\.com\//.test(tab.url || "")) { status.textContent="Open youtube.com first, then click a control."; return; }
    await chrome.tabs.sendMessage(tab.id,{...message,source:"yhal-popup"});
    status.textContent="Sent to your YouTube tab.";
  } catch (_) { status.textContent="Reload the YouTube tab after installing or updating the extension."; }
}
document.querySelectorAll("button[data-action]").forEach(button => button.addEventListener("click",()=>{
  const message={action:button.dataset.action};
  if(button.dataset.key) message.key=button.dataset.key;
  if(button.dataset.seconds) message.seconds=Number(button.dataset.seconds);
  send(message);
}));