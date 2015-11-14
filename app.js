var named = require('named-regexp').named;

var QuitCommand = {
    exec: function() {
        Table.printOutput();
        process.exit();     
    }    
};

var MoveOntoCommand = {
    exec: function(args) {
        var a = parseInt(args[1]);
        var b = parseInt(args[2]);
        Table.moveOntoCommand(a, b);    
    }
};

var MoveOverCommand = {
    exec: function(args) {
        var a = parseInt(args[1]);
        var b = parseInt(args[2]);
        Table.moveOverCommand(a, b);    
    }
};


var PileOntoCommand = {
    exec: function(args) {
        var a = parseInt(args[1]);
        var b = parseInt(args[2]);
        Table.pileOntoCommand(a, b);    
    }
};

var PrintTableCommand = {
    exec: function() {
        Table.printOutput();
    }
};


var Table = {
    blocks: [],
    index: {},
    setLayout: function(blockCount) {
        this.blocks = new Array(blockCount);
        for(var i=0; i < this.blocks.length; i++) {
            this.blocks[i] = [i];
            this.index[i] = { blockIndex: i, stackIndex: 0 };
        }
    },
    moveOntoCommand: function(a, b) {
        var aBlockindex = this.fnBlockIndex(a);
        var bBlockindex = this.fnBlockIndex(b);
        var aStackIndex = this.fnStackIndex(a);
        var bStackIndex = this.fnStackIndex(b);
        var aBlock      = this.blocks[aBlockindex];
        var bBlock      = this.blocks[bBlockindex];
        
        if(a === b || aBlockindex === bBlockindex) return;

        this.fnReset(aBlock, aStackIndex + 1);
        this.fnReset(bBlock, bStackIndex + 1);
        
        bBlock.push(a);
        aBlock.pop();
         
        this.index[a].stackIndex = bBlock.length-1;
        this.index[a].blockIndex = bBlockindex;
    },
    moveOverCommand: function(a, b) {
        var aBlockindex = this.fnBlockIndex(a);
        var bBlockindex = this.fnBlockIndex(b);
        var aStackIndex = this.fnStackIndex(a);
        var bStackIndex = this.fnStackIndex(b);
        var aBlock      = this.blocks[aBlockindex];
        var bBlock      = this.blocks[bBlockindex];
        
        if(a === b || aBlockindex === bBlockindex) return;

        this.fnReset(aBlock, aStackIndex + 1);

        bBlock.push(a);
        aBlock.pop();
         
        this.index[a].stackIndex = bBlock.length-1;
        this.index[a].blockIndex = bBlockindex;
    },
   pileOntoCommand: function(a, b) {
        var aBlockindex = this.fnBlockIndex(a);
        var bBlockindex = this.fnBlockIndex(b);
        var aStackIndex = this.fnStackIndex(a);
        var bStackIndex = this.fnStackIndex(b);
        var aBlock      = this.blocks[aBlockindex];
        var bBlock      = this.blocks[bBlockindex];
        
        if(a === b || aBlockindex === bBlockindex) return;

        this.fnReset(bBlock, bStackIndex + 1);

        for(var i = aStackIndex; i < aBlock.length; i++) {
            var block = aBlock[i]  
            bBlock.push(block);
            this.index[block].blockIndex = bBlockindex;
            this.index[block].stackIndex = bBlock.length - 1;
        }
        
        for(var i = aStackIndex, len = aBlock.length; i < len; i++) { 
            aBlock.pop();
        }
    },
    fnBlockIndex: function(block) {
        return this.index[block].blockIndex;    
    },
    fnStackIndex: function(block) {
        return this.index[block].stackIndex;
    },
    fnReset: function(blocks, stackIndex) {
        for(var i = stackIndex; i < blocks.length; i++) {
            var block = blocks[i];
            this.index[block] = { blockIndex: block, stackIndex: 0 };
            this.blocks[block] = [block];
        }    
        for(var i = stackIndex, len = blocks.length; i < len; i++) {
             blocks.pop();
        }
    },
    printOutput: function() {
        for(var i=0; i < this.blocks.length; i++) {
            console.log('%s%s', i, this.fnPrintStack(this.blocks[i]));    
        }  
    },
    fnSeek: function(array, blockNumber) {
        for(var i=0; i < array.length; i++) {
            if(array[i] == blockNumber) return i;
        }
    },
    fnPrintStack: function(stack) {
        var s = ':';
        for(var i=0; i < stack.length; i++) {
            s = s + ' ' + stack[i];
        }
        return s;
    }
};

var Program = {
    readyToAcceptCommands: false,
    commands: [{
        cmd: QuitCommand    , regex: /^quit/mi
    },{ cmd: MoveOntoCommand, regex: /^move (:<block_a>[0-9]{1}[0-9]*) onto (:<block_b>[0-9]{1}[0-9]*)/mig
    },{ cmd: MoveOverCommand, regex: /^move (:<block_a>[0-9]{1}[0-9]*) over (:<block_b>[0-9]{1}[0-9]*)/mig
    },{ cmd: PileOntoCommand, regex: /^pile (:<block_a>[0-9]{1}[0-9]*) onto (:<block_b>[0-9]{1}[0-9]*)/mig
    }],
    run: function() {
        var me = this;
        var stdin = process.openStdin();
        stdin.addListener("data", function(data) {
            var cmdline = data.toString().trim();
            
            if(!me.readyToAcceptCommands) {
                var blockCount = parseInt(cmdline);
                Table.setLayout(blockCount);
                me.readyToAcceptCommands = true;
            }
            else {
                for(var i = 0; i < me.commands.length; i++) {
                    var cmd = me.commands[i];
                    var args = named(cmd.regex).exec(cmdline);
                    if(args) {
                        cmd.cmd.exec(args);
                    }
                }
            }
        });    
    }    
};

Program.run();

