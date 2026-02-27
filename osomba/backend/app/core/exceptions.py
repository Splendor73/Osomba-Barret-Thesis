class DomainException(Exception):
    """Base class for all domain-specific exceptions."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class NotFoundException(DomainException):
    """Raised when a resource is not found."""
    pass

class PermissionDeniedException(DomainException):
    """Raised when a user does not have permission to perform an action."""
    pass

class BusinessRuleViolationException(DomainException):
    """Raised when a business rule is violated (e.g. insufficient stock)."""
    pass

class AuthenticationException(DomainException):
    """Raised when authentication fails."""
    pass
