/* 
This is all a work in progress. I'm expanding on the free Unity script called of course "DragRigidbody"
and attempting to add more "Amnesia-esque" features to it since that seems to be what a lot of people
are trying to achieve but falling short on. I am not an EXPERT by any means, this is not my job,
but with that said, I do have slight coding experience, and have a half decent grasp on maths.
Do not expect perfection, but I will try my best to make this work out well. 
*/

var spring = 50.0;
var damper = 5.0;
var drag = 10.0;
var angularDrag = 5.0;
var distance = 0.2;
var attachToCenterOfMass = false;
var speed = 0.2;
var throwForce : float;
var throwRange : float;
var oldSensY = 15;
var oldSensX = 15;

private var vertRotAxis : Vector3;
 private var horizontalRot : float;
 private var verticalRot : float;
 				
private var springJoint : SpringJoint;

function Start ()
{

}

function Update ()
{
        // Make sure the user pressed the mouse down
        if (!Input.GetMouseButtonDown (0))
        	return;
		if (!Input.GetMouseButtonDown (0))
			{
				Camera.main.GetComponent("MouseLook").sensitivityX = oldSensX;
				Camera.main.GetComponent("MouseLook").sensitivityY = oldSensY;
			}
		Screen.lockCursor = true;
        var mainCamera = FindCamera();
                
        // We need to actually hit an object
        var hit : RaycastHit;
        if (!Physics.Raycast(mainCamera.ScreenPointToRay(Input.mousePosition), hit, 4))
                return;
        // We need to hit a rigidbody that is not kinematic
        if (!hit.rigidbody || hit.rigidbody.isKinematic)
                return;
        
        if (!springJoint)
        {
                var go = new GameObject("Rigidbody dragger");
                body = go.AddComponent ("Rigidbody");
                springJoint = go.AddComponent ("SpringJoint");
                body.isKinematic = true;
        }
        
        springJoint.transform.position = hit.point;
        if (attachToCenterOfMass)
        {
                var anchor = transform.TransformDirection(hit.rigidbody.centerOfMass) + hit.rigidbody.transform.position;
                anchor = springJoint.transform.InverseTransformPoint(anchor);
                springJoint.anchor = anchor;
        }
        else
        {
                springJoint.anchor = Vector3.zero;
        }
        
        springJoint.spring = spring;
        springJoint.damper = damper;
        springJoint.maxDistance = distance;
        springJoint.connectedBody = hit.rigidbody;
        
        StartCoroutine ("DragObject", hit.distance);
}

function DragObject (distance : float)
{
        var oldDrag = springJoint.connectedBody.drag;
        var oldAngularDrag = springJoint.connectedBody.angularDrag;
		springJoint.connectedBody.drag = drag;
        springJoint.connectedBody.angularDrag = angularDrag;
        var mainCamera = FindCamera();
		
                                
		oldYRotCam = mainCamera.transform.eulerAngles.y;
		oldYRotObj = springJoint.connectedBody.transform.eulerAngles.y;
		oldYRotComp = oldYRotCam - oldYRotObj;

		while (Input.GetMouseButton (0))
        {
        		
        		newYRotCam = mainCamera.transform.eulerAngles.y;
        		newYRot = newYRotCam - oldYRotComp;
                var ray = mainCamera.ScreenPointToRay (Input.mousePosition);
                springJoint.transform.position = ray.GetPoint(distance);
                
                yield;
        if (Input.GetAxis("Rotate") == 0)
        	{
        		horzRot = springJoint.connectedBody.transform.InverseTransformDirection(Vector3.up).normalized;
        		springJoint.connectedBody.transform.Rotate(horzRot, Input.GetAxis("Mouse X") * 15);
        	}
        	
                        
        if (distance > 5)
			{
				distance = 5;
			}
		
		if (distance < 2)
			{
				distance = 2;
			}
		
		if (Input.GetAxis("Mouse ScrollWheel") > 0 && distance <= 5)
			{
				distance += speed;
			}
		
		if (Input.GetAxis("Mouse ScrollWheel") < 0 && distance >= 2)
			{
				distance -= speed;
			}
		
		if (Input.GetAxis("Rotate") == 0)
			{
				mainCamera.GetComponent("MouseLook").sensitivityX = oldSensX;
				mainCamera.GetComponent("MouseLook").sensitivityY = oldSensY;
			}
				
		if (Input.GetAxis("Rotate") != 0)
   			{
     			
				Camera.main.GetComponent("MouseLook").sensitivityX = 0F;
				Camera.main.GetComponent("MouseLook").sensitivityY = 0F;
		
 			  vertAxis = springJoint.connectedBody.transform.InverseTransformDirection(mainCamera.transform.TransformDirection(Vector3.right)).normalized;
 			  springJoint.connectedBody.transform.Rotate(vertAxis, Input.GetAxis("Mouse Y") * 6);
 			  
 			  horzAxis = springJoint.connectedBody.transform.InverseTransformDirection(mainCamera.transform.TransformDirection(Vector3.up)).normalized;
 			  springJoint.connectedBody.transform.Rotate(horzAxis, -Input.GetAxis("Mouse X") * 6);
 			  
 			  oldYRotCam = mainCamera.transform.eulerAngles.y;
			  oldYRotObj = springJoint.connectedBody.transform.eulerAngles.y;
			  oldYRotComp = oldYRotCam - oldYRotObj;
 			}
		
		
			
		if (Input.GetMouseButtonDown (1))
			{
				held = 0;
				mainCamera.GetComponent("MouseLook").sensitivityX = oldSensX;
				mainCamera.GetComponent("MouseLook").sensitivityY = oldSensY;
				springJoint.connectedBody.AddExplosionForce(throwForce,mainCamera.transform.position,throwRange);
				springJoint.connectedBody.drag = oldDrag;
				springJoint.connectedBody.angularDrag = oldAngularDrag;
				springJoint.connectedBody = null;
				StopCoroutine ("DragObject");
				yield;
			}
		
        }
        if (springJoint.connectedBody)
        {
                springJoint.connectedBody.drag = oldDrag;
                springJoint.connectedBody.angularDrag = oldAngularDrag;
                springJoint.connectedBody = null;
        }
}

function FindCamera ()
{
        if (camera)
                return camera;
        else
                return Camera.main;
}
