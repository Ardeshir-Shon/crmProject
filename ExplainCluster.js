class ExplainCluster{
    constructor(type,description){
        this.type=type;
        this.description=description;
    }
    getType(){
        return this.type;
    }
    getDescription(){
        return this.description;
    }
    setDescription(desc){
        this.description=desc;
    }
}
module.exports=ExplainCluster;