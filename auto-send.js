// runs only inside the WA-web popup
if(location.hostname==='web.whatsapp.com'){
  setTimeout(()=>{
    const sendBtn = document.querySelector('span[data-icon="send"]');
    if(sendBtn) sendBtn.click();
    window.close(); // vanish after sending
  }, 3000);
}
