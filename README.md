# MiniApp History

## Install
```bash
$ npm install miniapp-history --save
```

## Usage
```js
import { createMiniAppHistory } from 'miniapp-history';

const routes = [
  {
    'path': '/',
    'source': 'pages/Home/index'
  },
  {
    'path': '/page1',
    'source': 'pages/Page1/index',
  },
  {
    'path': '/page2',
    'source': 'pages/Page2/index'
  }
];

const history = createMiniAppHistory(routes);
```

## API

### Support
* push(path)
* replace(path)
* goBack(delta)
* canGo()

### UnSupport
* go(callback)
* goForward()
