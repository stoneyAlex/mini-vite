/*
 * @Author: shimingxia
 * @Date: 2022-06-27 20:35:50
 * @LastEditors: shimingxia
 * @LastEditTime: 2022-06-28 10:05:40
 * @Description: 
 */
// 起一个node服务器，处理浏览器加载各种资源的请求：index.html, js vue
const Koa = require('Koa')
const fs = require('fs')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDOM = require('@vue/compiler-dom')

function rewriteImport(content) {
  return content.replace(/ from ['"](.*)['"]/g, (s1, s2) => {
    if (s2.startsWith('./') || s2.startsWith('/') || s2.startsWith('../'))
      return s1
    else return ` from '/@modules/${s2}'`
  })
}

const app = new Koa()

app.use(async (ctx) => {
  const {url, query} = ctx.request
  console.log(url)

  if(url === '/') {
    ctx.type = 'text/html'
    ctx.body = fs.readFileSync(path.join(__dirname, './index.html'), 'utf8')
  } else if(url.endsWith('.js')) {
    const p = path.join(__dirname, url)
    console.log(p)
    ctx.type = 'application/javascript'
    ctx.body = rewriteImport(fs.readFileSync(p, 'utf8'))
  } else if (url.startsWith('/@modules')) {
    const moduleName = url.replace('/@modules/', '')
    const prefix = path.join(__dirname, 'node_modules', moduleName)
    const module = require(prefix + '/package.json').module
    const filePath = path.join(prefix, module)
    const ret = fs.readFileSync(filePath, 'utf8')
    ctx.type = 'application/javascript'
    ctx.body = rewriteImport(ret)
  } else if(url.indexOf('.vue') > -1) {
    console.log(url)
    const p = path.join(__dirname, url.split('?')[0])
    const ast = compilerSFC.parse(fs.readFileSync(p, 'utf8'))
    if(!query.type) {
      const scriptContent = ast.descriptor.script.content
      const script = scriptContent.replace(
        'export default',
        'const __script = '
      )
      ctx.type = 'application/javascript'
      ctx.body = `
      ${rewriteImport(script)}
      import {render as __render} from '${url}?type=template'
      __script.render = __render
      export default __script
      `
    } else if(query.type === 'template') {
      console.log('template')
      const tpl = ast.descriptor.template.content
      const render = compilerDOM.compile(tpl, { mode: 'module' }).code
      ctx.type = 'application/javascript'
      ctx.body = rewriteImport(render)
    }
  }
})

app.listen(4000, () => {
  console.log('This is my_vite')
})