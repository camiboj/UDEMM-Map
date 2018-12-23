$.ajax({
    url: 'data/informatica-1986.csv',
    dataType: 'text',
    success: function(data, jqXHR, textStatus) {graphFromCSV(data)}
})

function breakWords(string){
    broken = ''
    string.split(' ').forEach(element => {
        if (element.length < 9) {broken+=' '+element}
        else {broken+='\n'+element}
    });
    return broken.trim();
}

function getNode(rowCells){
    var codigo = rowCells[0]
    var materia = rowCells[1]
    var label = breakWords(materia)
    var creditos = rowCells[2]
    var correlativas = rowCells[3]
    var categoria = rowCells[4]
    var nivel = rowCells[5]
    var name = '[' + codigo + ']\n ' + materia
    
    if (creditos!=0){name+=' -- ' + creditos + ' créditos'}
    if (categoria.indexOf('x')!==-1){name+= ' -- ' + categoria}

    return {id:codigo, label:label, title:name, group:categoria, level:nivel,cid:1}
}

function graphFromCSV(data) {
    var nodes_arr = new Array()
    var nodes = new vis.DataSet([])
    var edges = new vis.DataSet([])

    var allRows = data.split(/\r?\n|\r/);
    for (var singleRow = 1; singleRow < allRows.length-1; singleRow++) {
        var rowCells = allRows[singleRow].split(',');
        if ($.inArray(rowCells[0],nodes_arr) == -1) {
            nodes_arr.push(rowCells[0])
            nodes.add(getNode(rowCells))
        }

        var correlativas = rowCells[3].split('-')
        correlativas.forEach(x => {
            edges.add({from:x,to:rowCells[0]})
        });
    } 
    
    var container = document.getElementById('grafo');

    var data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        nodes:{
            shape:'box'
        },
        layout: {
            hierarchical: {
                enabled: true,
                direction: 'LR',
            }
        },
        edges:{
            arrows: {
                to: {enabled: true, scaleFactor:1, type:'arrow'}
            },
        },
    };

    var network = new vis.Network(container, data, options);          
    
    clusterElectivas = {
        joinCondition:function(nodeOptions) {
            return nodeOptions.group === 'Materias Electivas';
        },
        clusterNodeProperties: {id: 'ME', shape:'circle', label: "Materias Electivas", group:'Materias Electivas', level:7}
    };

    clusterIndustrial = {
        joinCondition:function(nodeOptions) {
            return nodeOptions.group === 'Orientacion: Gestión Industrial de Sistemas';
        },
        clusterNodeProperties: {id: 'IND', shape:'square', label: breakWords('Orientacion: Gestión Industrial de Sistemas'),group:'Orientacion: Gestión Industrial de Sistemas', level:8}

    };

    clusterDistribuidos = {
        joinCondition:function(nodeOptions) {
            return nodeOptions.group === 'Orientacion: Sistemas Distribuidos';
        },
        clusterNodeProperties: {id: 'SD', shape:'hexagon', label: breakWords('Orientacion: Sistemas Distribuidos'),group:'Orientacion: Sistemas Distribuidos', level:8}
    };

    clusterProduccion = {
        joinCondition:function(nodeOptions) {
            return nodeOptions.group === 'Orientacion: Sistemas de Producción';
        },
        clusterNodeProperties: {id: 'SP', shape:'triangle', label: breakWords('Orientacion: Sistemas de Producción'),group:'Orientacion: Sistemas de Producción', level:8}                
    };

    network.cluster(clusterElectivas);
    network.cluster(clusterIndustrial);
    network.cluster(clusterDistribuidos);
    network.cluster(clusterProduccion);

    network.on("selectNode", function(params) {
        if (params.nodes.length == 1) {
            if (network.isCluster(params.nodes[0]) == true) {
                network.openCluster(params.nodes[0]);
            }
        }
    });

}