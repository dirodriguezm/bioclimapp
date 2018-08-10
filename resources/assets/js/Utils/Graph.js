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
        this.AdjList.set(v, []);
        this.noOfVertices++;
    }

    removeVertex(vert){
        var get_neighbours = this.AdjList.get(vert);
        for(let neighbours of get_neighbours){
            this.removeEdge(vert, neighbours);
        }
        this.AdjList.delete(vert);
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

    removeEdge(v, w){
        let removedW = this.AdjList.get(v).filter(id => id !== w);
        let removedV = this.AdjList.get(w).filter(id => id !== v);
        this.AdjList.set(v,removedW);
        this.AdjList.set(w,removedV);
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
        visited.set(vert, true);

        var get_neighbours = this.AdjList.get(vert);

        for (let neighbour of get_neighbours) {
            if (!visited.get(neighbour)){
                if(this.isCyclicUtil(neighbour, visited, vert))
                    return true;
            }

            else if( neighbour != parent )
                return true;

        }
        return false;
    }

    getCycle()
    {
        var cycles = [];


        var visited = new Map();
        // Call the recursive helper function to detect cycle in
        // different DFS trees
        for(let key of this.AdjList.keys()){
            visited.set(key, false);
        }
        var visited_reset = new Map(visited);

        for(let key of this.AdjList.keys()){
            if(!visited.get(key)){
                if(cycles.length > 0){
                    continue;
                }
                else {
                    visited = new Map(visited_reset);
                }
                if (this.isCyclicUtil(key, visited, -1)){
                    cycles.push(new Map(visited));

                }

            }

        }

        return cycles;
    }
}

export default Graph

