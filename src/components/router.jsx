const route = (url, name, tree) => <>
  {
    tree['/']
    ? <a href={url + '/'}><div>{name}</div></a>
    : <div>{name}</div>
  }
  <div class='router-layer'>
    {
      Object.entries(tree)
        .filter(([branch, _]) => branch != '/')
        .map(([branch, tree]) => route(url + '/' + branch, branch, tree))
    }
  </div>
</>;

export default ({ tree }) => <>
  { tree['/'] ? <a href='/'><div>Home</div></a> : <div>Home</div> }
  {
    Object.entries(tree)
      .filter(([branch, _]) => branch != '/')
      .map(([branch, tree]) => route('/' + branch, branch, tree))
  }
</>;
