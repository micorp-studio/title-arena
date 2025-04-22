export default eventHandler(async (event) => {
  const pathname = 'minias/' + getRouterParams(event).minia_path;
  return hubBlob().get(pathname);
})