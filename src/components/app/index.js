import React, { Component } from 'react';
import { Tree, Modal } from 'antd';
import GithubService from '../../service';
import JSLogo from '../../images/JavaScript.png';
import NodeJSLogo from '../../images/package.json.png';
import GitLogo from '../../images/git.png';
import CSSLogo from '../../images/CSS.png';
import HTMLLogo from '../../images/html5.png';
import Highlight from 'react-highlight';
import Spinner from '../spinner';

const { TreeNode, DirectoryTree } = Tree;

export default class extends Component {
  state = {
    path: '',
    treeData: [],
    review: 'Выберите файл',
    highlightClass: null,
    repo: 'Arithmetic-progression',
    loading: false,
    visibleModalWithImage: false,
    img: {
      src: '',
      title: ''
    }
  };
  iconsByExtension = {
    js: JSLogo,
    'package.json': NodeJSLogo,
    gitignore: GitLogo,
    css: CSSLogo,
    html: HTMLLogo
  };
  componentDidMount() {
    const repo = window.location.search.replace('?', '').split('=')[1];
    this.setState({ loading: true, repo }, () =>
      GithubService.getListOfFiles(
        this.state.repo,
        this.state.path
      ).then((treeData) => this.setState({ treeData, loading: false }))
    );
  }
  shorten = (str) => {
    if (str.length > 20) {
      return str.slice(0, 13) + '...' + str.slice(str.length - 5);
    }
    return str;
  };
  getFileExtension = (name, onlyExt) => {
    if (['package.json', 'package-lock.json'].indexOf(name) > -1 && !onlyExt)
      return 'package.json';
    else if (name.includes('webpack.config') && !onlyExt)
      return 'webpack.config';
    const match = name.match(/[.]([^.]*)$/);
    return match !== null ? match[1] : null;
  };
  getIcon = (name) => {
    const ext = this.getFileExtension(name);
    const icon = this.iconsByExtension[ext];
    if (icon === undefined) return { icon: <img /> };
    return {
      icon: <img src={icon} alt="1" className="icon" />
    };
  };
  onLoadData = (treeNode) =>
    new Promise(async (resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      const res = await GithubService.getListOfFiles(
        this.state.repo,
        treeNode.props.path + '/' + treeNode.props.title
      );
      treeNode.props.dataRef.children = res;
      this.setState({
        treeData: [...this.state.treeData]
      });
      resolve();
    });

  renderTreeNodes = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            title={this.shorten(item.title)}
            key={item.title}
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          {...item}
          {...(item.isLeaf ? this.getIcon(item.title) : null)}
          title={this.shorten(item.title)}
          key={item.title}
          dataRef={item}
        />
      );
    });
  isImage = (ext) => {
    const match = ext.match(/(png|jpg|gif)$/);
    return match !== null ? true : false;
  };
  isFont = (ext) => {
    const match = ext.match(/(woff|woff2|eot|ttf|otf)$/);
    return match !== null ? true : false;
  };
  onSelect = (keys, event) => {
    const path = event.node.props.path;
    const ext = this.getFileExtension(event.node.props.title, true);
    if (!event.node.props.isLeaf || this.isFont(ext)) {
      return;
    } else if (this.isImage(ext)) {
      const img = GithubService.getInfoAboutImage(this.state.repo, path);
      this.setState({ img, visibleModalWithImage: true });
      return;
    }
    this.setState({ loading: true, review: 'Загрузка..' });
    GithubService.getContent(this.state.repo, path).then((res) =>
      this.setState({
        review: res,
        highlightClass: ext,
        loading: false
      })
    );
  };

  handleCancel = (e) => {
    this.setState({
      visibleModalWithImage: false
    });
  };
  // Arithmetic-Progression
  render() {
    const { treeData, review, highlightClass, loading, img } = this.state;
    return (
      <>
        {loading && <Spinner />}
        <header className="header">
          <h1 className="header__title">{this.state.repo}</h1>
        </header>
        <div className="wrapper">
          <div className="tree">
            <DirectoryTree loadData={this.onLoadData} onSelect={this.onSelect}>
              {this.renderTreeNodes(treeData)}
            </DirectoryTree>
          </div>
          <div className="review">
            <Highlight className={highlightClass}>{review}</Highlight>
          </div>
        </div>
        <Modal
          width="500px"
          height="300px"
          title={img.title}
          maskClosable
          visible={this.state.visibleModalWithImage}
          onCancel={this.handleCancel}
          footer={null}
        >
          <img src={img.src} alt="" className="modal-image" />
        </Modal>
      </>
    );
  }
}
