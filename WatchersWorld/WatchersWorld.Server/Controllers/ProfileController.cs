using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        [HttpGet("get-profile")]
        public IActionResult GetProfile() 
        {
            return Ok(new JsonResult( new {message = "Apenas para logados."}));
        }
    }
}
