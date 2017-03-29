// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const clipboard = require('electron').clipboard

var originalSource
var projectPath = '/Users/apple/Documents/translation/phit_project_1'
var glossaryPath = projectPath + '/glossary/corpus.txt'

var annotatedSourcePane;
var annotatedTargetPane;
var machineTranslationPane;
var glossaryPane;
var glossaryManager;

$(document).ready( function () {

    // set up UI
    setupSplitters()
    setupEditors()
 
    originalSource = clipboard.readHTML()
    annotatedSourcePane.setContent(originalSource)
})

// UI initialzation
function setupSplitters() {
    document.querySelectorAll('.splitter').forEach(function (element) {
        setupSplitter(element);
    })
}

function setupSplitter(element) {
    // initialzation with recording some original values before any drag
    var prev = element.previousElementSibling
    var next = element.nextElementSibling
    var parent = element.parentElement

    var original_height_parent = parent.clientHeight   
    var original_width_parent = parent.clientWidth

    var horizontal = parent.classList.contains('rows') || element.classList.contains('horizontal')
    var vertical = parent.classList.contains('cols') || element.classList.contains('vertical')

    if (horizontal) {
        prev.style.flex = prev.clientHeight
        next.style.flex = next.clientHeight 
    } else if (vertical) {
        prev.style.flex = prev.clientWidth
        next.style.flex = next.clientWidth
    }
      
    function mouseDownHandler(ev){ 
        var ev = ev || window.event;  

        var original_Y = ev.clientY
        var original_X = ev.clientX
        var original_flex_prev = parseInt(prev.style.flex.split(' ')[0])
        var original_flex_next = parseInt(next.style.flex.split(' ')[0])
        var height_parent = parent.clientHeight   
        var width_parent = parent.clientWidth

        // record style values set inline
        var background = element.style.background 
        var cursor = element.style.cursor 


        element.style.background = 'lightgreen'

        var pseudo_layer = document.createElement("div")
        // set a full window pseudo layer to stablize the cursor style while dragging
        // otherwise cursor are shaking when moving out the drag bar
        pseudo_layer.style.position = 'absolute'
        pseudo_layer.style.height = '100%'
        pseudo_layer.style.width = '100%'
        document.body.appendChild(pseudo_layer)

        if (horizontal) {
            element.style.cursor = 'row-resize'
            pseudo_layer.style.cursor = 'row-resize'
        } else if (vertical) {
            element.style.cursor = 'col-resize'
            pseudo_layer.style.cursor = 'col-resize'
        }

        function mouseMoveHandler(ev){  
            var ev = ev || window.event 
 
            var delta = 0
            if (horizontal) {
                delta = (ev.clientY - original_Y) * original_height_parent / height_parent
            } else if (vertical) {
                delta = (ev.clientX - original_X) * original_width_parent / width_parent
            }
            
            prev.style.flex = original_flex_prev + delta
            next.style.flex = original_flex_next - delta
        }

        function mouseUpHandler(){  // clean up everything
            pseudo_layer.removeEventListener('mousemove', mouseMoveHandler)
            pseudo_layer.removeEventListener('mouseup', mouseUpHandler) 

            element.style.background = background; 
            element.style.cursor = cursor;
            document.body.removeChild(pseudo_layer)
        }

        pseudo_layer.addEventListener('mousemove', mouseMoveHandler)           
        pseudo_layer.addEventListener('mouseup', mouseUpHandler)  

        return false;  
    };  

    //element.addEventListener('mousedown', mouseDownHandler)   
    element.onmousedown = mouseDownHandler // exclude other handlers to ensure the designed behavior
}


function setupEditors() {
    annotatedSourcePane = new AnnotatedSource({ 
        'container': document.querySelector('.container.annotated.source')
    })
    annotatedSourcePane.initialize()
    annotatedSourcePane.addEventListener('submit', annotatedSourceSubmitted)
    
    glossaryPane = new GlossaryPane({ 
        'container': document.querySelector('.container.glossary')
    })
    glossaryManager = new GlossaryManager()
    glossaryManager.loadLocalFile(glossaryPath)   

}

function annotatedSourceSubmitted() {
    alert('annotatedSourceSubmitted')
}

function translateSource() {
    let source = $('#annotated-source div').html().trim()

    baidu_translate(originalSource, (d)=>{ 
        $('#machine-translation').append('<div contenteditable=true>' + d.trans_result[0].dst + '</div>')
    })   

    // analyze annotated source
    let frame = ''; 
    let corpus = '';

    //let corpusName = 'A'; //$X:A";
    let lc = 0;

    let corpusList = [];
    
    for (let i = 0; i < source.length; i++) {
        
        let c = source.charAt(i);
        
        if (c=='[') {
            lc++;
        } else if (c==']') {
            lc--;
                                
            let corpusName = 'A'+ Math.floor(Math.random()*90000+10000)
            let corpusObj = { 'name': corpusName, 'value': corpus, 'lang': 'zh' };
            
            corpusList.push(corpusObj);
            
            frame = frame + ' ' + corpusName + ' ';
            
            //reset corpus name for next occurrence
            //corpusName = ''+(parseInt(corpusName.charAt(0)) + 1);
            
            corpus = ''; 
        } else {
            if (lc > 0) {
                corpus += c;
            } else {
                frame += c;
            }
        }
        
    }

    console.log('frame: ', frame)

    query = frame
    for (let i in corpusList) {
        console.log(corpusList[i])
        query = query + '\n' + corpusList[i].value
    }

    baidu_translate(query, (d)=>{ 
        console.log(d) //d.trans_result



    })     

    // baidu_translate(source, (d)=>{
    //     $('#annotated-target').val(d.trans_result[0].dst)
    // })  
}

$('#annotated-source').keydown( function(e) {
    if(e.keyCode == 13 && e.ctrlKey) { 
        translateSource()
    }
})



// utilities
String.prototype.trim=function()
{
     return this.replace(/(^\s*)|(\s*$)/g, '');
}