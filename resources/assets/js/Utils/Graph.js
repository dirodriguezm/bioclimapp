class Graph {
    // defining vertex array and
    // adjacent list
    constructor(noOfVertices)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }

    // functions to be implemented

    // add vertex to the graph
    addVertex(v)
    {
        // initialize the adjacent list with a
        // null array
        console.log(v);
        this.AdjList.set(v, []);
        this.noOfVertices++;
    }
    // add edge to the graph
    addEdge(v, w)
    {
        // get the list for vertex v and put the
        // vertex w denoting edge betweeen v and w
        this.AdjList.get(v).push(w);

        // Since graph is undirected,
        // add an edge from w to w also
        this.AdjList.get(w).push(v);
    }



    printGraph()
    {
        // get all the vertices
        var get_keys = this.AdjList.keys();

        // iterate over the vertices
        for (var i of get_keys)
        {
            // great the corresponding adjacency list
            // for the vertex
            var get_values = this.AdjList.get(i);
            var conc = "";

            // iterate over the adjacency list
            // concatenate the values into a string
            for (var j of get_values)
                conc += j + " ";

            // print the vertex and its adjacency list
            console.log(i + " -> " + conc);
        }
    }

    // Recursive function which process and explore
// all the adjacent vertex of the vertex with which it is called
    isCyclicUtil(vert, visited, parent)
    {
        visited[vert] = true;
        console.log(vert);

        var get_neighbours = this.AdjList.get(vert);

        for (var i in get_neighbours) {
            var get_elem = get_neighbours[i];
            if (!visited[get_elem]){
                if(this.isCyclicUtil(get_elem, visited, vert))
                    return true;
            }

            else if( get_elem != parent )
                return true;

        }
        return false;
    }

    isCyclic()
    {

        var visited = [];
        for (var i = 0; i < this.noOfVertices; i++)
            visited[i] = false;

        // Call the recursive helper function to detect cycle in
        // different DFS trees
        for (var u = 0; u < this.noOfVertices ; u++){
            if(!visited[u]){
                if (this.isCyclicUtil(u, visited, -1))
                    return true;
            }
        }

        return false;
    }
}

export default Graph

