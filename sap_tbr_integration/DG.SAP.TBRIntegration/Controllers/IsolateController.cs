using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;
using DG.SAP.TBRIntegration.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DG.SAP.TBRIntegration.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IsolateController : ControllerBase
    {
        private readonly IIsolateRepository _isolateRepository;

        public IsolateController(IIsolateRepository isolateRepository)
        {
            _isolateRepository = isolateRepository;
        }

        /// <summary>
        ///     Get meta data for a specific isolate.
        /// </summary>
        // GET api/<IsolateController>/5
        [HttpGet("{isolateId}")]
        [Consumes("application/json")]
        [Produces("application/json", "application/problem+json")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Isolate>> GetMetaData(string isolateId)
        {
            var isolate = await _isolateRepository.GetIsolate(isolateId);
            if (isolate == null)
            {
                return NotFound();
            }

            return Ok(isolate);
        }

        /// <summary>
        ///     Update analysis approvals for a given isolate.
        /// </summary>
        // PUT api/<IsolateController>/
        [HttpPut]
        [Consumes("application/json")]
        [Produces("application/json", "application/problem+json")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> ApproveAnalysisValues([FromBody] IsolateUpdate isolateUpdate)
        {
            return await _isolateRepository.UpdateIsolate(isolateUpdate);
        }
    }
}