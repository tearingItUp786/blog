const clientcode = `
// Set the options globally
// to make LazyLoad self-initialize
window.lazyLoadOptions = {
    // Your custom settings go here
    restore_on_error: true
};

// Listen to the initialization event
// and get the instance of LazyLoad
window.addEventListener("LazyLoad::Initialized", function (event) {
    console.log('loaded')
    window.lazyLoadInstance = event.detail.instance;
}, false);
`

export function IframeLazy() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: clientcode,
        }}
      />
      <script
        async
        src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js"
      ></script>
    </>
  )
}
