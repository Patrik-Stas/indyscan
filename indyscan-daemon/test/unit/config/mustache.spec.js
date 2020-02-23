/* eslint-env jest */
const Mustache = require('mustache')
const path = require('path')

const input = {
  "comments": {
    "description": {
      "1": "Standard operation from ledger to elasticsearch"
    }
  },
  "objects": [
    {
      "interface": "Source",
      "impl": "ledger",
      "params": {
        "id": "source.{{{INDY_NETWORK}}}",
        "name": "{{{INDY_NETWORK}}}",
        "genesisPath": "{{{cfgdir}}}}/genesis/{{{INDY_NETWORK}}}.txn"
      }
    },
    {
      "interface": "Source",
      "impl": "elasticsearch",
      "params": {
        "id": "source.target.{{{INDY_NETWORK}}}",
        "url": "{{{URL_ELASTICSEARCH}}}",
        "index": "{{{TARGET_INDEX}}}"
      }
    },
    {
      "interface": "Target",
      "impl": "elasticsearch",
      "params": {
        "id": "target.{{{INDY_NETWORK}}}",
        "url": "{{{URL_ELASTICSEARCH}}}",
        "index": "{{{TARGET_INDEX}}}"
      }
    },
    {
      "interface": "Iterator",
      "impl": "guided",
      "params": {
        "id": "iterator.{{{INDY_NETWORK}}}",
        "source": "@@source.{{{INDY_NETWORK}}}",
        "sourceSeqNoGuidance": "@@source.target.{{{INDY_NETWORK}}}"
      }
    },
    {
      "interface": "Transformer",
      "impl": "expansion",
      "params": {
        "id": "transformer.expansion.{{{INDY_NETWORK}}}",
        "sourceLookups": "@@source.target.{{{INDY_NETWORK}}}"
      }
    },
    {
      "interface": "Transformer",
      "impl": "serializer",
      "params": {
        "id": "transformer.serializer.{{{INDY_NETWORK}}}"
      }
    },
    {
      "interface": "Worker",
      "impl": "worker-rtw",
      "params": {
        "id": "worker-rtw.{{{INDY_NETWORK}}}.domain",
        "subledger": "domain",
        "iterator": "@@iterator.{{{INDY_NETWORK}}}",
        "iteratorTxFormat": "original",
        "transformer": "@@transformer.expansion.{{{INDY_NETWORK}}}",
        "target": "@@target.{{{INDY_NETWORK}}}",
        "timing": "SLOW"
      }
    },
    {
      "interface": "Worker",
      "impl": "worker-rtw",
      "params": {
        "id": "worker-rtw.{{{INDY_NETWORK}}}.config",
        "subledger": "config",
        "iterator": "@@iterator.{{{INDY_NETWORK}}}",
        "iteratorTxFormat": "original",
        "transformer": "@@transformer.expansion.{{{INDY_NETWORK}}}",
        "target": "@@target.{{{INDY_NETWORK}}}",
        "timing": "SLOW"
      }
    },
    {
      "interface": "Worker",
      "impl": "worker-rtw",
      "params": {
        "id": "worker-rtw.{{{INDY_NETWORK}}}.pool",
        "subledger": "pool",
        "iterator": "@@iterator.{{{INDY_NETWORK}}}",
        "iteratorTxFormat": "original",
        "transformer": "@@transformer.expansion.{{{INDY_NETWORK}}}",
        "target": "@@target.{{{INDY_NETWORK}}}",
        "timing": "SLOW"
      }
    }
  ]
}

var view = {
  title: "Joe",
  calc: function () {
    return 2 + 4;
  }
};


describe('configuration loading and processing', () => {
  it('should render final configuration', async () => {
    var view = {
      title: "Joe",
      INDY_NETWORK: "LOCALHOST_INDYSCAN",
      TARGET_INDEX: "txs-localhost",
      URL_ELASTICSEARCH: "http://localhost:9200",
      cfgdir: function () {
        return path.dirname(__dirname)
      }
    };
    // let inputAsString = JSON.stringify(input)
    var output = Mustache.render(JSON.stringify(input, null, 2), view);
    console.log(output)

    // var view = {
    //   title: "Joe",
    //   calc: function () {
    //     return '6';
    //   }
    // };
    //
    // var output = Mustache.render("{{{title}}} spends {{{calc}}}", view);
    // console.log(output)
  })
})
