using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TBR_SAP_integration.Models;
using TBR_SAP_integration.Repositories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TBR_SAP_integration.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IsolateController : ControllerBase
    {   
        private IIsolateRepository isolateRepository;

        public IsolateController(IIsolateRepository isolateRepository)
        {
            this.isolateRepository = isolateRepository;
        }

        /// <summary>
        /// Get meta data for a specific isolate.
        /// </summary>
        // GET api/<IsolateController>/5
        [HttpGet("{isolateId}")]
        [Consumes("application/json")]
        [Produces("application/json", "application/problem+json")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<Isolate> GetMetaData(string isolateId)
        {
            var isolate =  isolateRepository.GetIsolate(isolateId);
            if(isolate == null)
                return NotFound();

            return isolate;
        }

        /// <summary>
        /// Update analysis approvals for a given isolate.
        /// </summary>
        // PUT api/<IsolateController>/
        [HttpPut]
        [Consumes("application/json")]
        [Produces("application/json", "application/problem+json")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<bool> ApproveAnalysisValues([FromBody] Approval approval)
        {
            return isolateRepository.Approve(approval);
        }
    }
}
