var spring = 50.0;
var damper = 5.0;
var drag = 10.0;
var angularDrag = 5.0;
var distance = 0.2;
var attachToCenterOfMass = false;
var speed = 0.2;
var throwForce : float;
var throwRange : float;
var oldSensX : float;
var oldSensY : float;
	
private var springJoint : SpringJoint;



function Update ()
{
        // Make sure the user pressed the mouse down
        if (!Input.GetMouseButtonDown (0))
                return;

		Screen.lockCursor = true;
        var mainCamera = FindCamera();
                
        // We need to actually hit an object
        var hit : RaycastHit;
        if (!Physics.Raycast(mainCamera.ScreenPointToRay(Input.mousePosition), hit, 100))
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
        var oldSensX = mainCamera.GetComponent("MouseLook").sensitivityX;
		var oldSensY = mainCamera.GetComponent("MouseLook").sensitivityY;
        
		oldYRotCam = mainCamera.transform.eulerAngles.y;
		oldYRotObj = springJoint.connectedBody.transform.eulerAngles.y;
		oldYRotComp = oldYRotCam - oldYRotObj;
		
		
		while (Input.GetMouseButton (0))
        {
        		
        		newYRotCam = mainCamera.transform.eulerAngles.y;
        		newYRot = newYRotCam - oldYRotComp;
                var ray = mainCamera.ScreenPointToRay (Input.mousePosition);
                springJoint.transform.position = ray.GetPoint(distance);
                springJoint.connectedBody.transform.eulerAngles.y = oldYRotObj + newYRot;
                yield;
        
        
        		
        	
                        
        if (distance > 4)
			{
				distance = 4;
			}
		
		if (distance < 2)
			{
				distance = 2;
			}
		
		if (Input.GetAxis("Mouse ScrollWheel") > 0 && distance <= 4)
			{
				distance += speed;
			}
		
		if (Input.GetAxis("Mouse ScrollWheel") < 0 && distance >= 2)
			{
				distance -= speed;
			}
			
		if (Input.GetAxis("Rotate") != 0)
   			{
     			
				Camera.main.GetComponent("MouseLook").sensitivityX = 0F;
				Camera.main.GetComponent("MouseLook").sensitivityY = 0F;
								
    			oldYRotObj += -Input.GetAxis("Mouse X");
    			springJoint.connectedBody.transform.RotateAround(mainCamera.transform.right, Input.GetAxis("Mouse Y") * Time.deltaTime);      			
    		}
		
		if (Input.GetAxis("Rotate") == 0)
			{
				mainCamera.GetComponent("MouseLook").sensitivityX = oldSensX;
				mainCamera.GetComponent("MouseLook").sensitivityY = oldSensY;
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