export default class {
  static getListOfFiles = async (repo, path = '') => {
    const res = await fetch(
      `https://api.github.com/repos/Fedy1661/${repo}/contents/${path}`
    );
    const list = [...(await res.json())].map((i) => ({
      title: i.name,
      path: i.type === 'file' ? path + '/' + i.name : path,
      isLeaf: i.type === 'file'
    }));
    list.sort((a, b) => a.isLeaf - b.isLeaf);
    return list;
  };
  static getContent = async (repo, path) => {
    const res = await fetch(
      `https://raw.githubusercontent.com/Fedy1661/${repo}/master${path}`
    );

    return await res.text();
  };
  static getInfoAboutImage = (repo, path) => {
    const src = `https://raw.githubusercontent.com/Fedy1661/${repo}/master${path}`;
    return { src, title: src.match(/[/]([^/]*)$/)[1] };
  };
}