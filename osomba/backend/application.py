"""
WSGI entry point for AWS Elastic Beanstalk
"""
from app.main import app

# Export the app for Elastic Beanstalk
application = app
