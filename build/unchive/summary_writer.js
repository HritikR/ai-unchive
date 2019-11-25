import{SummaryNode,AssetNode,HeaderNode,ScreenNode,ChainedNode}from"../views/nodes/node.js";import{View}from"../views/view.js";import{Label,Dialog,AssetFormatter,Downloader}from"../views/widgets.js";export class SummaryWriter{static async generateSummmaryNodesForProject(e,t){this.header=new HeaderNode("Download summary","save_alt"),this.header.addStyleName("unchive-summary-node__header"),t.addNode(this.header),this.header.addClickListener(t=>{SummaryHTMLWriter.writeProjectSummary(e)}),t.addNodeAsync(SummaryNode.promiseNode("Stats",this.generateStats(e))),t.addNodeAsync(SummaryNode.promiseNode("Most used components",this.generateMostUsed(e))),t.addNodeAsync(SummaryNode.promiseNode("% of blocks by screen",this.generateCodeShare(e).getHTML())),t.addNodeAsync(SummaryNode.promiseNode("Assets by type",this.generateAssetTypeShare(e).getHTML())),t.addNodeAsync(SummaryNode.promiseNode("% of built-in components",this.generateNativeShare(e).getHTML())),t.addNodeAsync(SummaryNode.promiseNode("Block usage by type",this.getBlockTypeShare(e).getHTML()))}static generateStats(e){let t=new View("DIV");t.addView(new SummaryItem("Number of screens",e.screens.length)),t.addView(new SummaryItem("Number of extensions",e.extensions.length));let s=0;for(var r of e.assets)s+=r.size;return t.addView(new SummaryItem("Number of assets",e.assets.length)),t.addView(new SummaryItem("Total size of assets",AssetFormatter.formatSize(s))),t.domElement.innerHTML}static generateMostUsed(e){let t=new View("DIV"),s=[];function r(e){var t=s.find(t=>t[0]==e.type);t?t[1]++:s.push([e.type,1]);for(let t of e.children)r(t)}for(let t of e.screens)r(t.form);s=s.sort((e,t)=>t[1]-e[1]);for(var a=0;a<8;a++)t.addView(new SummaryItem(Messages[s[a][0][0].toLowerCase()+s[a][0].slice(1)+"ComponentPallette"]||s[a][0],s[a][1]));return t.domElement.innerHTML}static generateCodeShare(e){let t=[["Screen","Percentage"]];for(let s of e.screens)t.push([s.name,Array.from((new DOMParser).parseFromString(s.blocks,"text/xml").getElementsByTagName("block")).length]);return new SummaryChart(t)}static generateAssetTypeShare(e){let t=[["Asset type","Percentage"]];for(let r of e.assets){var s=t.find(e=>e[0]==r.type.toLowerCase());s?s[1]++:t.push([r.type.toLowerCase(),1])}return new SummaryChart(t)}static generateNativeShare(e){let t=["Built-in",0],s=["Extensions",0];function r(e,t,s){for(var a of("EXTENSION"==e.origin?t[1]++:s[1]++,e.children))r(a,t,s)}for(let a of e.screens)r(a.form,s,t);return new SummaryChart([["Type","Percentage"],t,s])}static getBlockTypeShare(e){let t=0,s=0,r=0,a=0,o=0;for(let n of e.screens){var i=(new DOMParser).parseFromString(n.blocks,"text/xml");t+=Array.from(i.querySelectorAll('block[type="component_event"]')).length,s+=Array.from(i.querySelectorAll('block[type="component_method"]')).length,r+=Array.from(i.querySelectorAll('block[type="component_set_get"]')).length,a+=Array.from(i.querySelectorAll('block[type="procedures_defnoreturn"], block[type="procedures_defreturn"]')).length,o+=Array.from(i.querySelectorAll('block[type="global_declaration"]')).length}return new SummaryChart([["Type","Percentage"],["Events",t],["Methods",s],["Properties",r],["Variables",o],["Procedures",a]],[Blockly.COLOUR_EVENT,Blockly.COLOUR_METHOD,Blockly.COLOUR_SET,"rgb(244, 81, 30)","#AAA"])}}class SummaryItem extends Label{constructor(e,t){super(`${e} <span>${t}</span>`,!0),this.addStyleName("summary-item")}}class SummaryChart extends View{constructor(e,t){super("DIV"),e=google.visualization.arrayToDataTable(e),this.options={legend:{position:"right",textStyle:{color:"black"}},pieSliceTextStyle:{color:"#000",background:"#FFF"},pieHole:.5,width:260,chartArea:{left:0,top:20,width:"100%",height:"100%"},enableInteractivity:!1},t&&(this.options.colors=t),this.chart=new google.visualization.PieChart(this.domElement),this.chart.draw(e,this.options)}getHTML(){return this.domElement.outerHTML}getChartHTML(){var e=this.domElement.getElementsByTagName("svg")[0];return e.setAttribute("xmlns","http://www.w3.org/2000/svg"),e.outerHTML}}class SummaryHTMLWriter{static writeProjectSummary(e){var t=new Dialog("Generating summary...","This may take a while");setTimeout(()=>{t.open()},1),setTimeout(()=>{var s=[],r=[];s.push("<html>"),s.push(`<head><title>Project Summary for ${e.name}</title></head>`),s.push("<body>"),s.push('<div style="text-align:center;width:100%;">'+`<h1 style="margin-bottom:0">${e.name} - Project Summary</h1>`),s.push(`<h5 style="margin-top:0">Summary generated on ${this.getDateTime()}</h5></div>`),this.writeTOContents(s,e),this.writeStats(s,e),this.writeInsights(s,r,e),this.writeScreens(s,r,e),this.writeExtensions(s,e),this.writeStyles(s,r),s.push("</body></html>"),r.push([new Blob([s.join("")],{type:"image/svg+xml"}),`${e.name}.html`]),this.zipAllBlobs(r),t.close(),console.log(r)},20)}static getDateTime(){var e=new Date;return e.getDate()+"/"+(e.getMonth()+1)+"/"+e.getFullYear()+" @ "+e.getHours()+":"+e.getMinutes()}static writeTOContents(e,t){e.push("<h3>Table of Contents</h3>"),e.push("<ol>"),e.push('<li><a href="#stats">Project stats</a></li>'),e.push('<li><a href="#insights">Insights</a></li>'),e.push("<li>Screens</li><ol>");for(let s of t.screens)e.push(`<li><a href="#screen-${s.name}">${s.name}</a></li>`);e.push("</ol>"),e.push('<li><a href="#exts">Extensions summary</a></li>'),e.push("</ol>")}static writeStats(e,t){e.push('<a name="stats"></a>'),e.push("<h3>Project stats</h3>"),e.push(SummaryWriter.generateStats(t).replace(/<p/g,"<li").replace(/\/p>/g,"/li>")),e.push("<h4>Most used components</h4>"),e.push(SummaryWriter.generateMostUsed(t).replace(/<p/g,"<li").replace(/\/p>/g,"/li>"))}static writeInsights(e,t,s){e.push('<a name="insights"></a>'),e.push("<h3>Insights</h3>"),t.push([new Blob([SummaryWriter.generateCodeShare(s).getChartHTML()],{type:"image/svg+xml"}),"code_share.svg"]),t.push([new Blob([SummaryWriter.generateAssetTypeShare(s).getChartHTML()],{type:"image/svg+xml"}),"asset_type_share.svg"]),t.push([new Blob([SummaryWriter.generateNativeShare(s).getChartHTML()],{type:"image/svg+xml"}),"native_share.svg"]),t.push([new Blob([SummaryWriter.getBlockTypeShare(s).getChartHTML()],{type:"image/svg+xml"}),"block_type_share.svg"]),e.push('<div style="display:inline-block">'),e.push('<div class="chart"><img src="code_share.svg"></img>'),e.push("<p>Percentage of blocks by screen</p></div>"),e.push('<div class="chart"><img src="asset_type_share.svg"></img>'),e.push("<p>Types of assets by frequency</p></div>"),e.push("</div>"),e.push('<div style="display:inline-block">'),e.push('<div class="chart"><img src="native_share.svg"></img>'),e.push("<p>Percentage of built-in components vs extensions used</p></div>"),e.push('<div class="chart"><img src="block_type_share.svg"></img>'),e.push("<p>Percentage of blocks by type</p></div>"),e.push("</div>")}static writeScreens(e,t,s){var r=0;for(let n of RootPanel.primaryNodeList.nodes)if(n instanceof ScreenNode){e.push(`<a name="screen-${n.caption}"></a>`),e.push(`<h3>${n.caption}</h3>`),e.push("<h4>Components</h4>"),e.push("<ul>"),this.writeComponent(e,s.screens.find(e=>e.name==n.caption).form),e.push("</ul><br>"),e.push("<h4>Blocks</h4>"),n.open(),n.chainNodeList.nodes[1].open();var a=0;for(let s of n.chainNodeList.nodes[1].chainNodeList.nodes){s.initializeWorkspace(),e.push(`<img src="block_${r}_${a}.svg">`);var o=s.domElement.children[1].children[0].innerHTML.replace(/&nbsp;/g," "),i=[];i.push(`<style>${document.head.children[0].innerHTML}</style>`),i.push("<style>.blocklyMainBackground{stroke-width:0}.blocklySvg{position:relative;width:100%}</style>"),o=o.substring(0,o.indexOf("</svg>"))+i.join("")+"</svg>",t.push([new Blob([o],{type:"image/svg+xml"}),`block_${r}_${a}.svg`]),e.push('<p class="blk-cap"></p>'),a++}r++}RootPanel.primaryNodeList.nodes.slice(-1)[0].open()}static writeComponent(e,t){e.push(`<li>${t.name} <small>(${t.type})</small></li>`);for(let s of t.children)e.push("<ul>"),this.writeComponent(e,s),e.push("</ul>")}static writeExtensions(e,t){e.push('<a name="exts"></a>'),e.push("<h3>Extensions summary</h3>");for(let s of t.extensions)e.push(`<li>${s.name}<ul><li>${s.descriptorJSON.helpString}</li></ul></li>`)}static writeStyles(e,t){e.push('<style>body{max-width:1000px;margin:0 auto;border:1px solid #DDD;padding:20px;font-family: sans-serif}span::before{content:": "}.chart{display:block;margin:0 40px;}.blk-cap:empty::after{content:"[Caption]"; font-style:italic;color:#888}@media print{.blk-cap:empty{display:none}}@page{margin-bottom:0}</style>'),e.push('<script>document.designMode = "on"<\/script>')}static zipAllBlobs(e){zip.createWriter(new zip.BlobWriter("application/zip"),t=>{this.zipBlob(t,e)})}static zipBlob(e,t){if(t.length>0){let s=t.pop();e.add(s[1],new zip.BlobReader(s[0]),()=>{this.zipBlob(e,t)})}else e.close(e=>{Downloader.downloadBlob(e,"project.zip")})}}