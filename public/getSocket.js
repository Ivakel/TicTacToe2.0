function makeMove(el) {
  if (multiplayer) {
    if (!canMakeMove) {
      return;
    }
  }
  makeMoveOnApp(el);
  console.log("this");
}
