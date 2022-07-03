const sendEventToIntercom = (eventName, metadata) => {
  if (window.Intercom) window.Intercom('trackEvent', eventName, metadata);
};

export default sendEventToIntercom;
